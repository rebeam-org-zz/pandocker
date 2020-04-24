local function has_value (tab, val)
  for index, value in ipairs(tab) do
      if value == val then
          return true
      end
  end

  return false
end

-- TODO detect errors
-- TODO test latex
local formats = {
  html = function(block, layout, id)
    local svg = pandoc.pipe("dot", {"-Tsvg", "-K" .. layout}, block.text)
    return pandoc.RawBlock("html", "<div id=\"" .. id .. "\" class=\"graphviz\">" .. svg .. "</div>")
  end,
  latex = function(block, layout, id)
    local tex = pandoc.pipe("dot2tex", {"--figonly", "--progoptions=-K" .. layout}, block.text)
    return pandoc.RawBlock("latex", tex)
  end,
  default = function(block, layout, id)
    local fname = os.tmpname()
    -- local fname = pandoc.sha1(block.text)

    local fnamelow = fname .. ".lowdpi.png"
    local fnamehigh = fname .. ".highdpi.png"

    -- dot doesn't embed the dpi in the PNG file
    pandoc.pipe("dot", {"-Tpng", "-Gdpi=300", "-K" .. layout, "-o" .. fnamelow}, block.text)
    -- so we reprocess with pngcrush, which may also decrease file size
    -- pandoc will respect the image dpi, e.g. for docx, to produce nice sharp images at a reasonable size
    pandoc.pipe("pngcrush", {"-res", "300", fnamelow, fnamehigh}, "")

    return pandoc.Para({pandoc.Image({}, fnamehigh)})
  end
}

return {
  {
    CodeBlock = function(block)
      if has_value(block.classes, "graphviz") then
        local layout = block.attributes["layout"] or "dot"
        local id = block.identifier

        local f = formats[FORMAT] or formats["default"]
        return f(block, layout, id)
      end
    end
  }
}