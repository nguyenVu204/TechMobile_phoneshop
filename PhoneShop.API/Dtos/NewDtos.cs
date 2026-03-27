namespace PhoneShop.API.Dtos
{
    public class CreateNewsDto
    {
        public string Title { get; set; }
        public string Slug { get; set; }
        public string Summary { get; set; }
        public string Content { get; set; }
        public string Thumbnail { get; set; }
        public string Status { get; set; }
        public int? RelatedProductId { get; set; }
        public List<int> CategoryIds { get; set; } = new List<int>();
    }
}
